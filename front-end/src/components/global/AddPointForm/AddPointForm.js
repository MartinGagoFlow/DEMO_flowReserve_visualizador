// components/global/AddPointForm.js
import { useState } from 'react';
import { useVTKDrawing } from '../../../utils/nodes/useVTKDrawing';
import CustomButton from '../CustomButton';
import './AddPointForm.css';

/**
 * Formulario para añadir un punto al modelo 3D.
 *
 * @param {Function} onAddPoint - Función callback que recibe el punto [x, y, z] validado.
 */
const AddPointForm = () => {
  const [newPoint, setNewPoint] = useState({ x: '', y: '', z: '' });
  const { createPoint } = useVTKDrawing();

  /**
   * Observa los cambios en los inputs y actualiza el estado.
   * @param {*} e 
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPoint((prev) => ({ ...prev, [name]: value }));
  };



  const handleAddClick = () => {
    const x = parseFloat(newPoint.x);
    const y = parseFloat(newPoint.y);
    const z = parseFloat(newPoint.z);

    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      alert('Por favor, introduce coordenadas válidas.');
      return;
    }

    createPoint([x, y, z], 2, [
      Math.random(),
      Math.random(),
      Math.random()
    ]); // Crea el punto directamente

    setNewPoint({ x: '', y: '', z: '' }); // limpiamos inputs
  };

  return (
    <div className='add-point-form-component'>
      <div>
        <h4>Añadir punto</h4>
        <label>
          X: <input type="number" name="x" value={newPoint.x} onChange={handleInputChange} />
        </label>
      </div>
      <div>
        <label>
          Y: <input type="number" name="y" value={newPoint.y} onChange={handleInputChange} />
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Z: <input type="number" name="z" value={newPoint.z} onChange={handleInputChange} />
        </label>
      </div>
      <CustomButton onClick={handleAddClick} text={"Añadir punto"}></CustomButton>
    </div>
  );
};

export default AddPointForm;
