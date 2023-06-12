import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/summary', async () => {
    const summary = await knex('transactions')
      .sum('amount', {
        as: 'amount',
      })
      .first()
    return { summary }
  })
  app.get('/', async () => {
    const transactions = await knex('transactions').select()
    return { transactions }
  })
  app.get('/:id', async (request) => {
    const transactionsParams = z.object({
      id: z.string().uuid(),
    })
    const { id } = transactionsParams.parse(request.params)
    const transaction = await knex('transactions').where('id', id).first()
    return { transaction }
  })
  app.post('/', async (request, reply) => {
    const createTranasctionsBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })
    const { title, amount, type } = createTranasctionsBodySchema.parse(
      request.body,
    )
    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
    })
    reply.status(201).send()
  })
}
