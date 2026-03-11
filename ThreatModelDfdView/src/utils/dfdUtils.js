import { DFD_TYPES } from '../constants/dfdTypes';

export const getStyleByType = (typeString) => {
  const baseStyle = {
    background: '#fff',
    padding: 10,
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px'
  };

  if (typeString === DFD_TYPES.PROCESS) {
    return { ...baseStyle, border: '1px solid black', borderRadius: '50%', width: 100, height: 100 };
  } else if (typeString === DFD_TYPES.ACTOR) {
    return { ...baseStyle, border: '1px solid black', borderRadius: '4px', width: 150, height: 60 };
  } else if (typeString === DFD_TYPES.DATA_STORE) {
    return { ...baseStyle, width: 150, height: 60, border: 'none', borderTop: '2px solid black', borderBottom: '2px solid black', borderRadius: 0 };
  }

  return { ...baseStyle, border: '1px solid black', width: 150 };
};
