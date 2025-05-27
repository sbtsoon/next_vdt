import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();
  const { assistant, query } = body;

  const formBody = new URLSearchParams();
  formBody.append("assistant", assistant);
  formBody.append("query", query);

  const res = await fetch("http://121.133.205.199:14803/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formBody.toString(),
  });

  const data = await res.json();
  return NextResponse.json(data);
}
