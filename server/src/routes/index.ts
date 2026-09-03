import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { productRoutes } from './products.routes';
import { orderRoutes } from './orders.routes';
import { cartRoutes } from './cart.routes';
import { paymentRoutes } from './payments.routes';
import { userRoutes } from './user.routes';
import { adminRoutes } from './admin.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/user', userRoutes);
apiRouter.use('/admin', adminRoutes);
