import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProductService {
  static async listProducts(options: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (options.category && options.category !== 'All') {
      where.category = { contains: options.category, mode: 'insensitive' };
    }

    if (options.search) {
      where.OR = [
        { title: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } }
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }, // or soldCount depending on requirements
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getProductById(id: number) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          where: { status: 'approved' }
        }
      }
    });

    if (!product || !product.isActive) {
      throw new Error('Product not found');
    }

    return product;
  }
  
  static async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        variants: true,
      }
    });

    if (!product || !product.isActive) {
      throw new Error('Product not found');
    }

    return product;
  }
}
