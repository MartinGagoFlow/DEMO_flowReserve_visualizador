import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./ModelSelector.css"

function ModelSelector() {
  const [models, setModels] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/models')
      .then(response => response.json())
      .then(data => setModels(data))
      .catch(error => console.error('Error fetching models:', error));
  }, []);

  const handleModelSelect = (model) => {
    navigate(`/view/${model}`, { state: { model } });
  };

  return (
    <div className='body-model-selector'>
      <h1 className='title-model-selector'>Selecciona un modelo disponible:</h1>
      <ul>
        {models.map((model, index) => (
          <li key={index}>
            <button className='btn-selector' onClick={() => handleModelSelect(model)}>
              {model}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ModelSelector;
