"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useBooking } from "@/_models/booking";
import { useEffect } from "react";
import DraftOrInProgressBooking from "./_components/DraftOrInProgressBooking";
import ConfirmedBooking from "./_components/ConfirmedBooking";

export default function Book() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const bookingID = searchParams.get("bookingID");
  const clientSecret = searchParams.get("clientSecret");
  const { data: booking, isPending: isPendingBooking } = useBooking({
    id: bookingID ?? undefined,
    refetchIfInProgress: !clientSecret,
  });

  useEffect(() => {
    if (
      !bookingID ||
      (!isPendingBooking && (!booking || !booking.packID)) ||
      (!!booking?.status &&
        !["draft", "inProgress", "confirmed"].includes(booking.status))
    ) {
      router.replace("/");
    }
  }, [booking, bookingID, isPendingBooking, router]);

  if (isPendingBooking || !bookingID || !booking || !booking.packID) {
    return null;
  }

  return (
    <>
      {(booking.status === "draft" || booking.status === "inProgress") && (
        <DraftOrInProgressBooking booking={booking} />
      )}
      {booking.status === "confirmed" && <ConfirmedBooking booking={booking} />}
    </>
  );
}
