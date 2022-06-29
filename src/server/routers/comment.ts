import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createRouter } from '~/server/createRouter';
import { prisma } from '~/server/prisma';

const defaultCommentSelect = Prisma.validator<Prisma.CommentSelect>()({
  id: true,
  name: true,
  message: true,
  createdAt: true,
  updatedAt: true,
});

export const commentRouter = createRouter()
  .query('all', {
    async resolve() {
      /**
       * For pagination you can have a look at this docs site
       * @link https://trpc.io/docs/useInfiniteQuery
       */

      return prisma.comment.findMany({
        select: defaultCommentSelect,
      });
    },
  })
  .query('byPostId', {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
      const { id } = input;
      const comments = await prisma.comment.findMany({
        where: { postId: id },
        select: defaultCommentSelect,
      });

      if (!comments) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No comment with postId '${id}'`,
        });
      }
      return comments;
    },
  })
  .mutation('add', {
    input: z.object({
      name: z.string().min(1),
      message: z.string().min(1),
      postId: z.string().uuid(),
    }),
    async resolve({ input }) {
      const comment = await prisma.comment.create({
        data: input,
        select: defaultCommentSelect,
      });
      return comment;
    },
  });
