import { useEffect, useState } from "react";
import CustomCheckbox from "../global/CustomCheckbox/CustomCheckbox"


const BtnToggleOpacity = ({ actor, renderWindowRef }) => {

    const [isOpaque, setIsOpaque] = useState(true);

    useEffect(() => {
        // Sincronizar la opacidad inicial con el actor si está definido
        if (actor) {
            actor.getProperty().setOpacity(isOpaque ? 1.0 : 0.5);
            renderWindowRef.current?.render();
        }
    }, [actor, isOpaque, renderWindowRef]);


    const handleToggle = (e) => {
        const newState = e.target.checked;
        setIsOpaque(newState);
    };
    return (<CustomCheckbox
        id="toggle-opacity"
        checked={isOpaque}
        onChange={handleToggle}
        label="Opacidad"
        title="Alternar opcacidad del modelo"
    />)
}

export default BtnToggleOpacity;