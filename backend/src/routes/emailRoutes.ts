import express from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validationMiddleware';
import { sendEmail } from '../utils/emailUtils';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Email
 *   description: E-posta işlemleri
 */

const newsletterSchema = z.object({
  email: z.string().email(),
});

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});

/**
 * @swagger
 * /api/email/newsletter:
 *   post:
 *     summary: Bülten üyeliği gönderimi
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Gönderildi
 */
router.post('/newsletter', validate(newsletterSchema), async (req, res, next) => {
  try {
    const { email } = req.body;
    await sendEmail({
      to: email,
      subject: 'Newsletter Subscription',
      html: `<p>Thank you for subscribing to our newsletter.</p>`,
    });
    res.json({ success: true, message: 'Subscribed' });
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /api/email/contact:
 *   post:
 *     summary: İletişim formu gönderimi
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               message: { type: string }
 *     responses:
 *       200:
 *         description: Gönderildi
 */
router.post('/contact', validate(contactSchema), async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    await sendEmail({
      to: 'support@example.com',
      subject: `Contact form from ${name}`,
      html: `<p>From: ${name} (${email})</p><p>${message}</p>`,
    });
    res.json({ success: true, message: 'Message sent' });
  } catch (e) { next(e); }
});

export default router;


