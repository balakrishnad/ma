import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';
import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';

import './styles/sass/index.scss';


const LoadableApp = lazy(() => import(/* webpackChunkName: "mediaAnnexApp" */ './App'));
const LoadingMessage = () => "Loading...";

const RenderDom = () => {
  return (
    <Suspense fallback={<LoadingMessage />}>
      <LoadableApp />
    </Suspense>
  );
};

ReactDOM.render(<RenderDom />, document.getElementById('root'));
