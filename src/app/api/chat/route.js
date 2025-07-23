import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();
  const { assistant, query } = body;

  const form = new FormData();
  form.append("assistant", assistant);
  form.append("query", query);

  const res = await fetch("http://192.168.1.154:14803/chat", {
    method: "POST",
    body: form,
  });

  const data = await res.json();
  return NextResponse.json(data);
}
