import React, { useEffect, useRef, useState } from 'react';
import ModelSelector from './pages/ModelSelector';

const App = () => {
    const [selectedModel, setSelectedModel] = useState('');

    return(
      <ModelSelector></ModelSelector>
    )
};

export default App;
