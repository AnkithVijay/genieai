
import { GET_DEFI_DATA } from "@/app/utils/urls";
import { NextRequest } from "next/server";

const Auth = `Basic ${Buffer.from(
  `${process.env.ZAPPER_API_KEY}:`,
  "binary"
).toString("base64")}`;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");
  const response = await fetch(`${GET_DEFI_DATA}${address}`, {
    headers: {
      accept: "*/*",
      Authorization: Auth,
    },
  });
  if (response.ok) {
    const data = await response.json();
    return Response.json(data, { status: 200 });
  } else {
    console.log("error");
    return Response.json(
      { message: "error" },
      {
        status: 500,
      }
    );
  }
}
