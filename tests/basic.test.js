import prejss from '../src/index';

it('plain css parsed to object', () => {
  const colors = {
    main: 'red',
  }

  const widht = wide => wide ? '100px' : '50px';

  const style = ({ main }) => prejss`
    button {
      width: ${widht};
      height: 100px;
      background: ${main};
      &:hover {
        color: black;
      }
    }
  `
  expect(style(colors)).toEqual({
    button: {
      width: widht,
      height: '100px',
      background: 'red',
      '&:hover': {
        color: 'black',
      }
    }
  })
})