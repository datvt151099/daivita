import React, {useState} from 'react';
import {
  Tooltip
} from "@material-ui/core";
import {RiEdit2Fill} from "react-icons/ri";
import Paper from "./index";

// eslint-disable-next-line react/prop-types
const EditPaper = ({_id, title, body, background, type, role, callback}) => {
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  }

  return <div>
    <Tooltip
      title="Chỉnh sửa"
      aria-label="eidt"
    >
      <div><RiEdit2Fill size={24} color="#3C77AA" onClick={() => setOpen(true)}/></div>
    </Tooltip>
    <Paper
      open={open}
      handleClose={handleClose}
      setOpen={setOpen}
      callback={callback}
      title={title}
      role={role}
      type={type}
      id={_id}
      background={background}
      body={body}
      edit
    />

  </div>
}

export default EditPaper;
