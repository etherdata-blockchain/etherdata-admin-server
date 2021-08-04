import React from 'react';

interface UIProviderInterface {
  drawerOpen: boolean;
  setDrawerOpen(v: boolean): void;
}

//@ts-ignore
export const UIProviderContext = React.createContext<UIProviderInterface>({});

export default function UIProviderProvider(props: any) {
  const { children } = props;
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const value: UIProviderInterface = {
    drawerOpen,
    setDrawerOpen,
  };

  return (
    <UIProviderContext.Provider value={value}>
      {children}
    </UIProviderContext.Provider>
  );
}
