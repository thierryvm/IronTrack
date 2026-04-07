import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import FAQPage from '@/app/faq/page'

describe('FAQPage', () => {
  it('exposes accessible search and category controls', () => {
    render(<FAQPage />)

    expect(
      screen.getByRole('heading', { level: 1, name: /questions fréquentes/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /catégories/i })
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/rechercher dans la faq/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /training partners/i })
    ).toBeInTheDocument()
  })

  it('filters questions from search input', async () => {
    const user = userEvent.setup()

    render(<FAQPage />)

    const search = screen.getByLabelText(/rechercher dans la faq/i)
    await user.type(search, 'badge')

    expect(
      screen.getByRole('button', { name: /comment fonctionnent les badges/i })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /comment changer mon pseudo/i })
    ).not.toBeInTheDocument()
  })
})
