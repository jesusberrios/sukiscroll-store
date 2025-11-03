import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { items, customer } = await req.json();

        // Calcula el total
        const total = items.reduce((sum: number, i: any) => sum + i.price * (i.quantity || 1), 0);

        // Genera los parámetros para Flow
        const params = new URLSearchParams({
            amount: total.toString(),
            customer_name: customer.name,
            customer_email: customer.email,
            // Usa una URL pública, por ejemplo la que te da loca.lt
            success_url: `${process.env.NEXT_PUBLIC_FLOW_BASE}/checkout?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_FLOW_BASE}/checkout?success=false`,
        });

        const checkoutUrl = `https://www.flow.cl/checkout?${params.toString()}`;

        return NextResponse.json({ checkoutUrl });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Error creando checkout' }, { status: 500 });
    }
}
