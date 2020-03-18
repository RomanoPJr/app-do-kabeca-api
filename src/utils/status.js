const getStatusTranslate = status => {
  let translate = '';
  switch (status) {
    case 'ACTIVE':
      translate = 'Ativo';
      break;
    case 'INACTIVE':
      translate = 'Inativo';
      break;
    case 'TESTER':
      translate = 'Tester';
      break;
    case 'Ativo':
      translate = 'ACTIVE';
      break;
    case 'Inativo':
      translate = 'INACTIVE';
      break;
    case 'Tester':
      translate = 'TESTER';
      break;
    default:
      break;
  }
  return translate;
};

export default getStatusTranslate;
