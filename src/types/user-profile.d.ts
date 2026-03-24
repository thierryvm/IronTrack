export interface UserProfile {
 id: string;
 name: string;
 email: string;
 phone?: string;
 location?: string;
 avatar?: string;
 height: number;
 weight: number;
 age: number;
 gender:'Homme' |'Femme' |'Autre';
 goal:'Prise de masse' |'Perte de poids' |'Maintien' |'Performance';
 experience:'Débutant' |'Intermédiaire' |'Avancé';
 joinDate: string;
 pseudo?: string;
 initial_weight?: number;
 frequency?:'Faible' |'Modérée' |'Élevée';
 availability?: number;
} 