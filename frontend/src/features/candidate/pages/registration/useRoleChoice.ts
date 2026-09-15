import { useNavigate } from 'react-router-dom';

export function useRoleChoice() {
  const navigate = useNavigate();

  const handleSelectCandidate = () => {
    navigate('/register/candidate');
  };

  const handleSelectCompany = () => {
    navigate('/register/company');
  };

  return {
    handleSelectCandidate,
    handleSelectCompany,
  };
}