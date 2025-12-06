import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    top: [
      { id: 1, name: "Aman Verma", totalSpent: "€ 244.00", email: "aman@example.com" },
      { id: 2, name: "Priya Singh", totalSpent: "€ 199.00", email: "priya@example.com" },
      { id: 3, name: "Rohit Jain", totalSpent: "€ 530.00", email: "rohit@example.com" },
      { id: 4, name: "Sneha Patel", totalSpent: "€ 870.00", email: "sneha@example.com" },
      { id: 5, name: "Vikas Kumar", totalSpent: "€ 645.00", email: "vikas@example.com" },
    ],
  });
}
