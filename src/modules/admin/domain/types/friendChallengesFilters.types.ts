export type FriendChallengesFilterState = {
  search: string;
  difficulty: string;
  subjectId: string;
  fromDate: string;
  toDate: string;
  status: string;
};

export const DEFAULT_FRIEND_CHALLENGES_FILTERS: FriendChallengesFilterState = {
  search: "",
  difficulty: "all",
  subjectId: "all",
  fromDate: "",
  toDate: "",
  status: "all",
};
