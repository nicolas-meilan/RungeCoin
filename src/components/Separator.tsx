import styled from 'styled-components/native';

const Separator = styled.View`
  border: 1px solid ${({ theme }) => theme.colors.text.secondary};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-vertical: ${({ theme }) => theme.spacing(2)};
`;

export default Separator;
