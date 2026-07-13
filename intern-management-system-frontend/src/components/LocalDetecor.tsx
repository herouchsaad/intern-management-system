import React, { ReactNode, useEffect, useState } from 'react';
import { ConfigProvider } from 'antd';
import dayjs from 'dayjs';

import enUS from 'antd/locale/en_US'; // Default Ant Design locale
import trTR from 'antd/locale/tr_TR'; // Turkish Ant Design locale
import "dayjs/locale/tr";
import "dayjs/locale/en"

interface PropType {
    children: ReactNode;
}

const LocaleDetector: React.FC<PropType> = ({ children}) => {
  const [locale, setLocale] = useState(trTR);
  dayjs.locale("tr");

  useEffect(() => {
    const browserLocale = navigator.language.toLowerCase();

    if (browserLocale.startsWith('en')) {
      setLocale(enUS);  
      dayjs.locale("en");
    }
    
  }, []);

  

  return (
    <ConfigProvider locale={locale}>
        {children}
    </ConfigProvider>
  );
};

export default LocaleDetector;