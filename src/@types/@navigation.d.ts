export interface UserParams {
  userName: string;
}

export declare global {
  namespace ReactNavigation {
    interface RootParamList {
      home: undefined;
      user: UserParams;
    }
  }
}
