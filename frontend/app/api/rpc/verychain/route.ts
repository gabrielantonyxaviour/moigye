import { NextRequest, NextResponse } from 'next/server'

const VERYCHAIN_RPC_URL = 'https://rpc.verylabs.io'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(VERYCHAIN_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const text = await response.text()

    // Try to parse as JSON, otherwise return as-is
    let data
    try {
      data = JSON.parse(text)
    } catch {
      console.error('VeryChain RPC non-JSON response:', text.substring(0, 200))
      return NextResponse.json(
        { error: 'Invalid RPC response', details: text.substring(0, 200) },
        { status: 502 }
      )
    }

    return NextResponse.json(data, {
      status: response.status,
    })
  } catch (error) {
    console.error('VeryChain RPC proxy error:', error)
    return NextResponse.json(
      { error: 'RPC proxy request failed', message: String(error) },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
