import Razorpay from 'razorpay';
import crypto from 'crypto';

const key_id = process.env.RAZORPAY_KEY_ID as string;
const key_secret = process.env.RAZORPAY_KEY_SECRET as string;

if (!key_id || !key_secret) {
  console.warn('Razorpay keys are not set. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local');
}

export const razorpay = new Razorpay({ key_id, key_secret });

export function verifySignature({ orderId, paymentId, signature }: { orderId: string; paymentId: string; signature: string; }) {
  if (!key_secret) {
    console.error('Razorpay signature verification failed: RAZORPAY_KEY_SECRET is missing');
    return false;
  }
  try {
    const hmac = crypto.createHmac('sha256', key_secret);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest('hex');
    const match = generatedSignature === signature;
    if (!match) {
      console.error('Razorpay signature mismatch', {
        orderId,
        paymentId,
        expectedSignature: generatedSignature,
        receivedSignature: signature,
      });
    }
    return match;
  } catch (err) {
    console.error('Error during Razorpay signature verification', err);
    return false;
  }
}