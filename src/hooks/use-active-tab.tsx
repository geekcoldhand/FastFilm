import { useState } from "react";

const  useActiveTab = (initialTab = null) => {
  const [activeTabControl, setActiveTabControl] = useState<string | null>(initialTab);
  const isTabOpen = !!activeTabControl;

  const openTab = (tab: string) => setActiveTabControl(tab);
  const closeTab = () => setActiveTabControl(null);

  return { activeTabControl, isTabOpen, openTab, closeTab };
}

export default useActiveTab;
