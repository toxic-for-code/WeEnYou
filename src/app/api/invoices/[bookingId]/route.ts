import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    const booking = await Booking.findById(params.bookingId)
      .populate('hallId')
      .populate('userId') as any;

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Authorization check
    const isUser = booking.userId?._id?.toString() === session.user.id;
    const isOwner = booking.hallId?.ownerId?.toString() === session.user.id;

    if (!isUser && !isOwner && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized access to invoice' }, { status: 403 });
    }

    // FONT CONFIG - Stable implementation using process.cwd()
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Regular.ttf');
    const boldFontPath = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Bold.ttf');
    
    const hasRegular = fs.existsSync(fontPath);
    const hasBold = fs.existsSync(boldFontPath);

    // Create PDF - We pass the font in the constructor and disable autoFirstPage 
    // to strictly prevent Helvetica from ever being initialized.
    const doc = new PDFDocument({ 
      margin: 50, 
      font: hasRegular ? fontPath : undefined,
      autoFirstPage: false
    });
    
    const chunks: Buffer[] = [];

    // Register and set as default immediately
    if (hasRegular) {
      doc.registerFont('Roboto', fontPath);
    }
    if (hasBold) {
      doc.registerFont('Roboto-Bold', boldFontPath);
    }

    // Add the first page manually and set the font explicitly
    doc.addPage();
    if (hasRegular) doc.font('Roboto');

    doc.on('data', (chunk) => chunks.push(chunk));

    // HEADER SECTION
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 45 });
    }
    
    // Left side: Title
    doc
      .fillColor('#111827')
      .fontSize(18);
    
    if (hasBold) doc.font('Roboto-Bold');
    doc.text('WeEnYou', 105, 50);
    
    if (hasRegular) doc.font('Roboto');
    doc
      .fontSize(10)
      .fillColor('#6b7280')
      .text('WeEnYou Booking Invoice', 105, 72);

    // Right side: Invoice Info
    const invoiceDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    doc
      .fillColor('#111827')
      .fontSize(10)
      .text(`Invoice #: INV-${(booking._id as any).toString().slice(-6).toUpperCase()}`, 350, 50, { align: 'right' })
      .fillColor('#6b7280')
      .text(`Date: ${invoiceDate}`, 350, 65, { align: 'right' });

    // Header Divider
    doc
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .moveTo(50, 100)
      .lineTo(550, 100)
      .stroke();

    // TWO COLUMN SECTION (Customer & Venue)
    const user = booking.userId as any;
    const hall = booking.hallId as any;
    const sectionTop = 125;

    // Left Column: Customer Details
    if (hasBold) doc.font('Roboto-Bold');
    doc
      .fontSize(11)
      .fillColor('#111827')
      .text('Customer Details', 50, sectionTop);
    
    if (hasRegular) doc.font('Roboto');
    doc
      .fontSize(9)
      .fillColor('#4b5563')
      .text(`Name: ${user?.name || 'N/A'}`, 50, sectionTop + 18)
      .text(`Email: ${user?.email || 'N/A'}`, 50, sectionTop + 32)
      .text(`Phone: ${user?.phone || 'N/A'}`, 50, sectionTop + 46);

    // Right Column: Venue Details
    if (hasBold) doc.font('Roboto-Bold');
    doc
      .fontSize(11)
      .fillColor('#111827')
      .text('Venue Details', 320, sectionTop);
    
    if (hasRegular) doc.font('Roboto');
    doc
      .fontSize(9)
      .fillColor('#4b5563')
      .text(`Hall Name: ${hall?.name || 'N/A'}`, 320, sectionTop + 18)
      .text(`Location: ${hall?.location?.address || hall?.location?.city || 'N/A'}`, 320, sectionTop + 32)
      .text(`Event Date: ${new Date(booking.startDate).toLocaleDateString()}`, 320, sectionTop + 46)
      .text(`Guest Count: ${booking.guests}`, 320, sectionTop + 60);

    // BOOKING DETAILS BLOCK
    const bookingTop = sectionTop + 90;
    if (hasBold) doc.font('Roboto-Bold');
    doc
      .fontSize(11)
      .fillColor('#111827')
      .text('Booking Details', 50, bookingTop);
    
    if (hasRegular) doc.font('Roboto');
    doc
      .fontSize(9)
      .fillColor('#4b5563')
      .text(`Booking ID: ${booking._id}`, 50, bookingTop + 18)
      .text(`Start Date: ${new Date(booking.startDate).toLocaleDateString()}`, 50, bookingTop + 32)
      .text(`End Date: ${new Date(booking.endDate).toLocaleDateString()}`, 50, bookingTop + 46);

    // Divider
    doc
      .strokeColor('#f3f4f6')
      .lineWidth(1)
      .moveTo(50, bookingTop + 65)
      .lineTo(550, bookingTop + 65)
      .stroke();

    // PRICING TABLE
    const tableTop = bookingTop + 85;
    
    // CALCULATION LOGIC
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Venue Rental = dailyPrice * totalDays
    const dailyPrice = hall?.price || 0;
    const venueRental = dailyPrice * totalDays;
    
    // Platform Fee (one-time)
    const platformFeePercent = typeof hall?.platformFeePercent === 'number' ? hall.platformFeePercent : 10;
    const platformFee = Math.round(dailyPrice * (platformFeePercent / 100));
    
    // Taxes (18% on platform fee)
    const taxAmount = Math.round(platformFee * 0.18);

    // Header
    if (hasBold) doc.font('Roboto-Bold');
    doc
      .fontSize(10)
      .fillColor('#6b7280')
      .text('Description', 50, tableTop)
      .text('Amount (INR)', 400, tableTop, { align: 'right' });

    doc
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    if (hasRegular) doc.font('Roboto');
    doc
      .fontSize(10)
      .fillColor('#111827')
      .text(`Venue Rental (₹${dailyPrice.toLocaleString()} x ${totalDays} ${totalDays > 1 ? 'days' : 'day'})`, 50, tableTop + 30)
      .text(`₹${venueRental.toLocaleString()}`, 400, tableTop + 30, { align: 'right' })
      
      .text('Platform Fee (one-time)', 50, tableTop + 50)
      .text(`₹${platformFee.toLocaleString()}`, 400, tableTop + 50, { align: 'right' })
 
      .text('Taxes (GST)', 50, tableTop + 70)
      .text(`₹${taxAmount.toLocaleString()}`, 400, tableTop + 70, { align: 'right' });

    doc
      .strokeColor('#e5e7eb')
      .lineWidth(0.5)
      .moveTo(50, tableTop + 90)
      .lineTo(550, tableTop + 90)
      .stroke();

    // GRAND TOTAL
    if (hasBold) doc.font('Roboto-Bold');
    doc
      .fontSize(14)
      .fillColor('#111827')
      .text('Grand Total', 50, tableTop + 105)
      .text(`₹${booking.totalPrice.toLocaleString()}`, 400, tableTop + 105, { align: 'right' });
    
    // PAYMENT SUMMARY SECTION
    const paymentTop = tableTop + 150;
    
    // Background light gray box for payment details
    doc
      .rect(50, paymentTop, 500, 60)
      .fill('#f9fafb');

    if (hasBold) doc.font('Roboto-Bold');
    doc
      .fontSize(11)
      .fillColor('#111827')
      .text('Payment Summary', 70, paymentTop + 15);

    if (hasRegular) doc.font('Roboto');
    const advancePaid = (booking.payment?.advanceAmount || (booking as any).advanceAmount || 0);
    const balanceDue = (booking.payment?.remainingBalance || (booking as any).remainingBalance || 0);
    const pStatus = (booking.payment?.paymentStatus || (booking as any).paymentStatus || 'pending');

    doc
      .fontSize(10)
      .fillColor('#059669') // Green-600
      .text(`Advance Paid:`, 250, paymentTop + 15)
      .text(`- ₹${advancePaid.toLocaleString()}`, 400, paymentTop + 15, { align: 'right' })
      .fillColor('#dc2626') // Red-600
      .text(`Remaining Balance:`, 250, paymentTop + 35)
      .text(`₹${balanceDue.toLocaleString()}`, 400, paymentTop + 35, { align: 'right' });

    // STATUS SECTION
    const statusTop = paymentTop + 80;
    if (hasBold) doc.font('Roboto-Bold');
    doc
      .fontSize(11)
      .fillColor('#111827')
      .text('Status', 50, statusTop);

    if (hasRegular) doc.font('Roboto');
    doc
      .fontSize(10)
      .fillColor('#4b5563');
      
    const getStatusLabel = (s: string) => {
      if (s === 'waiting_owner_confirmation') return 'Booking Processing';
      return s.toUpperCase().replace(/_/g, ' ');
    };

    if (hasBold) doc.font('Roboto-Bold');
    doc.text(`Booking Status: `, 50, statusTop + 20);
    if (hasRegular) doc.font('Roboto');
    doc.text(`${getStatusLabel(booking.status)}`, 140, statusTop + 20);

    if (hasBold) doc.font('Roboto-Bold');
    doc.text(`Payment Status: `, 50, statusTop + 35);
    if (hasRegular) doc.font('Roboto');
    doc.text(`${pStatus.toUpperCase()}`, 140, statusTop + 35);

    if (booking.status === 'cancellation_requested' && booking.cancellationRequestedAt) {
      const cancelDate = new Date(booking.cancellationRequestedAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      if (hasBold) doc.font('Roboto-Bold');
      doc.text(`Request Date: `, 50, statusTop + 50);
      if (hasRegular) doc.font('Roboto');
      doc.text(`${cancelDate}`, 140, statusTop + 50);
    }
    
    // FOOTER
    doc
      .fontSize(9)
      .fillColor('#9ca3af')
      .text('Thank you for choosing WeEnYou!', 50, 710, { align: 'center' })
      .text('support@weenyou.com  •  www.weenyou.com', 50, 725, { align: 'center' });

    doc.end();

    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    return new Response(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=invoice-${booking._id}.pdf`,
      },
    });

  } catch (error: any) {
    console.error('Invoice generation error:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}
