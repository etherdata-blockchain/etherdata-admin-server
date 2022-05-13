// @flow
import * as React from "react";

interface UserInfoInterface {
  isLoading: boolean;
  submit(): void;
  setIsLoading(v: boolean): void;
  formButton: any;
}

// @ts-ignore
export const ReactJsonFormContext = React.createContext<UserInfoInterface>({});

/**
 * Device provider for using devices
 * @param props
 * @constructor
 */
export default function ReactJsonFormProvider(props: any) {
  const { children } = props;
  const [isLoading, setIsLoading] = React.useState(false);
  const formButton = React.useRef<any>();
  const submit = React.useCallback(() => {
    if (formButton.current) {
      formButton.current.click();
    }
  }, [formButton]);

  const value: UserInfoInterface = {
    formButton,
    submit,
    isLoading,
    setIsLoading,
  };

  return (
    <ReactJsonFormContext.Provider value={value}>
      {children}
    </ReactJsonFormContext.Provider>
  );
}
