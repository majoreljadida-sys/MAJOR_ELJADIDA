import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { ExpenseForm } from '../expense-form'
import type { ExpenseCategoryKey, PaymentMethodKey } from '@/lib/expenses'

export const dynamic = 'force-dynamic'

export default async function EditExpensePage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const [expense, events] = await Promise.all([
    (prisma as any).expense.findUnique({ where: { id: params.id } }),
    prisma.event.findMany({
      select: { id: true, title: true },
      orderBy: { date: 'desc' },
      take: 50,
    }),
  ])

  if (!expense) notFound()

  return (
    <ExpenseForm
      mode="edit"
      expenseId={expense.id}
      events={events}
      initial={{
        amount:        expense.amount,
        date:          expense.date.toISOString().slice(0, 10),
        category:      expense.category as ExpenseCategoryKey,
        description:   expense.description,
        supplier:      expense.supplier,
        paymentMethod: expense.paymentMethod as PaymentMethodKey,
        receiptUrl:    expense.receiptUrl,
        notes:         expense.notes,
        eventId:       expense.eventId,
      }}
    />
  )
}
