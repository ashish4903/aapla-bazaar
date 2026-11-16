import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

const messageOf = (link) => decodeURIComponent(link.getAttribute('href').split('?text=')[1]);

describe('App', () => {
  it('shows today’s rates in Marathi, and switches to English', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByRole('heading', { level: 2, name: 'आजचे भाव' })).toBeTruthy();
    expect(screen.getByText('टोमॅटो')).toBeTruthy();
    expect(document.documentElement.lang).toBe('mr');

    await user.click(screen.getByRole('button', { name: 'View in English' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Today’s rates' })).toBeTruthy();
    expect(document.documentElement.lang).toBe('en');
  });

  it('cannot add a sold-out item', async () => {
    render(<App />);
    await screen.findByText('पत्ताकोबी');
    expect(screen.queryByRole('button', { name: 'पत्ताकोबी घ्या' })).toBeNull();
    expect(screen.getByText('संपले')).toBeTruthy();
  });

  it('takes an order from basket to a WhatsApp message', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'टोमॅटो घ्या' }));
    await user.click(screen.getByRole('button', { name: 'टोमॅटो वाढवा' }));
    await user.click(screen.getByRole('button', { name: 'मेथी घ्या' }));
    expect(screen.getByText('500 ग्रॅम')).toBeTruthy();
    // 0.5 kg × ₹30 + 1 bunch × ₹15
    expect(document.querySelector('.basket-summary').textContent).toBe('2 वस्तू · ₹30');

    await user.click(screen.getByRole('button', { name: /ऑर्डर करा/ }));
    const send = screen.getByRole('link', { name: 'WhatsApp वर ऑर्डर पाठवा' });

    // No name yet: the link is stopped and says why
    await user.click(send);
    expect(screen.getByRole('alert').textContent).toContain('कृपया नाव लिहा');

    await user.type(screen.getByLabelText('नाव'), 'सीमा');
    await user.click(screen.getByLabelText('घरपोच'));
    await user.type(screen.getByLabelText('पत्ता / घर कुठे आहे'), 'मंदिराजवळ');

    const text = messageOf(screen.getByRole('link', { name: 'WhatsApp वर ऑर्डर पाठवा' }));
    expect(text).toContain('• टोमॅटो: 500 ग्रॅम = ₹15');
    expect(text).toContain('एकूण: ₹30');
    expect(text).toContain('नाव: सीमा');
    expect(text).toContain('घरपोच: मंदिराजवळ');
  });

  it('keeps the basket when the page is reopened', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'कांदा घ्या' }));
    cleanup();

    render(<App />);
    expect(await screen.findByText('250 ग्रॅम')).toBeTruthy();
  });
});
