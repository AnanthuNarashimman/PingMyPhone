import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import '../Styles/ComponentStyles/AddButton.css'

function AddButton({onClick}) {
  return (
    <button className="addButton" onClick={onClick}>
      <FontAwesomeIcon icon={faPlus} />
    </button>
  )
}

export default AddButton