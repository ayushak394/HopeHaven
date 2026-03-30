import { auth } from "./lib/firebase";
import axios from "axios";

export async function testSecureAPI() {
  if (!auth.currentUser) {
    console.error("No user is logged in");
    return;
  }

  const token = await auth.currentUser.getIdToken();

  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/secure-data`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  console.log(res.data);
}
