export type SwapQuery_Candidate = {
  seatId: number;
  seatNo: number;
  username: string;
  fullName: string;
  bus: {
    id: number;
    date: string; //2026-08-16T18:50:00.000Z
    busFrom: string;
    busTo: string;
    schedule: {
      id: string;
      departure: string;
      destination: string;
      time: string; //19:50
      type: "EVENING" | "MORNING";
    };
  };
  hasPendingRequest: boolean;
};

export type SwapQuery = {
  candidates: SwapQuery_Candidate[];
};

export type ReservationsResp = {
  res: {
    id: number;
  }[];
};
