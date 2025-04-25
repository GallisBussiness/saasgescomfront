import { createContext } from 'react';
import { createContextualCan } from '@casl/react';
import Ability from './Ability';

export const AbilityContext = createContext(Ability);
export const Can = createContextualCan(AbilityContext.Consumer);