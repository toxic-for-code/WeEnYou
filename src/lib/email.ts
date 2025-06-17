import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface BookingConfirmationEmailData {
  to: string;
  bookingId: string;
  hallName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
}

interface CancellationEmailData {
  to: string;
  bookingId: string;
  hallName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
}

interface PaymentConfirmationEmailData {
  to: string;
  bookingId: string;
  hallName: string;
  amount: number;
  paymentId: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

function generateBookingConfirmationEmail({
  bookingId,
  hallName,
  startDate,
  endDate,
  totalPrice,
}: Omit<BookingConfirmationEmailData, 'to'>) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Booking Confirmation</h2>
      <p>Your booking has been confirmed!</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Booking Details</h3>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Hall:</strong> ${hallName}</p>
        <p><strong>Check-in:</strong> ${new Date(startDate).toLocaleDateString()}</p>
        <p><strong>Check-out:</strong> ${new Date(endDate).toLocaleDateString()}</p>
        <p><strong>Total Amount:</strong> ₹${totalPrice}</p>
      </div>
      <p>Thank you for choosing our service!</p>
    </div>
  `;
}

function generateCancellationEmail({
  bookingId,
  hallName,
  startDate,
  endDate,
  totalPrice,
}: Omit<CancellationEmailData, 'to'>) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Booking Cancellation</h2>
      <p>Your booking has been cancelled.</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Booking Details</h3>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Hall:</strong> ${hallName}</p>
        <p><strong>Check-in:</strong> ${new Date(startDate).toLocaleDateString()}</p>
        <p><strong>Check-out:</strong> ${new Date(endDate).toLocaleDateString()}</p>
        <p><strong>Refund Amount:</strong> ₹${totalPrice}</p>
      </div>
      <p>The refund will be processed within 5-7 business days.</p>
      <p>We hope to serve you again in the future!</p>
    </div>
  `;
}

function generatePaymentConfirmationEmail({
  bookingId,
  hallName,
  amount,
  paymentId,
}: Omit<PaymentConfirmationEmailData, 'to'>) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Payment Confirmation</h2>
      <p>Your payment has been successfully processed!</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Payment Details</h3>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Hall:</strong> ${hallName}</p>
        <p><strong>Amount Paid:</strong> ₹${amount}</p>
        <p><strong>Payment ID:</strong> ${paymentId}</p>
      </div>
      <p>Thank you for your payment!</p>
    </div>
  `;
}

export async function sendBookingConfirmationEmail(data: BookingConfirmationEmailData) {
  await sendEmail({
    to: data.to,
    subject: 'Booking Confirmation',
    html: generateBookingConfirmationEmail(data),
  });
}

export async function sendCancellationEmail(data: CancellationEmailData) {
  await sendEmail({
    to: data.to,
    subject: 'Booking Cancellation',
    html: generateCancellationEmail(data),
  });
}

export async function sendPaymentConfirmationEmail(data: PaymentConfirmationEmailData) {
  await sendEmail({
    to: data.to,
    subject: 'Payment Confirmation',
    html: generatePaymentConfirmationEmail(data),
  });
} 