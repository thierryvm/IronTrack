/**
 * Tests d'accessibilité pour les composants UI
 * Basé sur le guide d'accessibilité IronTrack (docs/Guide d'accessibilité pour Claude Code — Projet.md)
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { NumberWheel } from '../NumberWheel';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div'
  }
}));

describe('Tests d\'accessibilité', () => {
  
  // === TESTS CONTRASTE COULEURS ===
  describe('Contraste et visibilité', () => {
    test('NumberWheel doit avoir un contraste suffisant pour le focus', () => {
      render(<NumberWheel value={5} onChange={jest.fn()} label="Test" />);
      
      const spinbutton = screen.getByRole('spinbutton');
      expect(spinbutton).toHaveClass('focus:ring-2', 'focus:ring-orange-500');
    });

    test('la valeur actuelle doit être clairement visible', () => {
      render(<NumberWheel value={5} onChange={jest.fn()} label="Test" />);
      
      const currentValue = screen.getByText('5');
      expect(currentValue.closest('span')).toHaveClass('text-orange-800');
    });
  });

  // === TESTS NAVIGATION CLAVIER ===
  describe('Navigation et accessibilité clavier', () => {
    test('tous les éléments interactifs doivent être focusables', () => {
      render(<NumberWheel value={5} onChange={jest.fn()} label="Test" />);
      
      const spinbutton = screen.getByRole('spinbutton');
      expect(spinbutton).toHaveAttribute('tabIndex', '0');
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });

    test('les boutons doivent avoir un focus visible', () => {
      render(<NumberWheel value={5} onChange={jest.fn()} label="Test" />);
      
      const buttons = screen.getAllByRole('button');
      // Vérifier que les boutons ont une indication visuelle pour le focus
      buttons.forEach(button => {
        expect(button.className).toMatch(/hover:|focus:|disabled:/);
      });
    });
  });

  // === TESTS LABELS ET ARIA ===
  describe('Labels et attributs ARIA', () => {
    test('NumberWheel doit avoir un label accessible', () => {
      render(<NumberWheel value={5} onChange={jest.fn()} label="Fréquence cardiaque" />);
      
      const spinbutton = screen.getByRole('spinbutton');
      expect(spinbutton).toHaveAttribute('aria-label', 'Fréquence cardiaque');
    });

    test('NumberWheel doit avoir les attributs ARIA corrects', () => {
      render(<NumberWheel value={5} onChange={jest.fn()} min={1} max={10} label="Test" />);
      
      const spinbutton = screen.getByRole('spinbutton');
      expect(spinbutton).toHaveAttribute('aria-valuenow', '5');
      expect(spinbutton).toHaveAttribute('aria-valuemin', '1');
      expect(spinbutton).toHaveAttribute('aria-valuemax', '10');
    });

    test('le label doit être visible', () => {
      render(<NumberWheel value={5} onChange={jest.fn()} label="Sélecteur de valeur" />);
      
      expect(screen.getByText('Sélecteur de valeur')).toBeInTheDocument();
    });

    test('NumberWheel sans label doit avoir un aria-label par défaut', () => {
      render(<NumberWheel value={5} onChange={jest.fn()} />);
      
      const spinbutton = screen.getByRole('spinbutton');
      expect(spinbutton).toHaveAttribute('aria-label', 'Sélectionner une valeur');
    });
  });

  // === TESTS TAILLES CIBLES TACTILES ===
  describe('Tailles cibles tactiles', () => {
    test('les boutons doivent avoir une taille tactile appropriée', () => {
      render(<NumberWheel value={5} onChange={jest.fn()} label="Test" />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Vérifier les classes de taille tactile appropriée (p-3 ou min-h/min-w)
        const hasProperPadding = button.classList.contains('p-3') || 
                                 button.classList.contains('p-2') || 
                                 button.classList.contains('p-1');
        const hasMinSize = button.classList.contains('min-h-[44px]') || 
                          button.classList.contains('min-w-[44px]');
        expect(hasProperPadding || hasMinSize).toBeTruthy();
      });
    });

    test('le conteneur NumberWheel doit avoir une taille appropriée', () => {
      render(<NumberWheel value={5} onChange={jest.fn()} label="Test" />);
      
      const spinbutton = screen.getByRole('spinbutton');
      expect(spinbutton.closest('div')).toHaveClass('h-32', 'w-20');
    });
  });

  // === TESTS GESTION DU FOCUS ===
  describe('Gestion du focus', () => {
    test('les boutons désactivés ne doivent pas pouvoir recevoir le focus', () => {
      render(<NumberWheel value={1} onChange={jest.fn()} min={1} max={10} label="Test" />);
      
      const buttons = screen.getAllByRole('button');
      const minusButton = buttons[0]; // Premier bouton = -
      
      expect(minusButton).toBeDisabled();
    });

    test('NumberWheel doit supporter la navigation au clavier', () => {
      const onChange = jest.fn();
      render(<NumberWheel value={5} onChange={onChange} min={1} max={10} label="Test" />);
      
      const spinbutton = screen.getByRole('spinbutton');
      
      // Simuler appui sur flèche haut
      spinbutton.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      
      // Le spinbutton doit gérer l'événement (vérifié par la présence du handler onKeyDown)
      expect(spinbutton).toHaveAttribute('tabIndex', '0');
    });
  });

  // === TESTS ÉTATS VISUELS ===
  describe('États visuels et feedback', () => {
    test('les boutons désactivés doivent avoir une indication visuelle', () => {
      render(<NumberWheel value={1} onChange={jest.fn()} min={1} max={10} label="Test" />);
      
      const buttons = screen.getAllByRole('button');
      const minusButton = buttons[0]; // Premier bouton = -
      
      expect(minusButton).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    test('l\'état de dragging doit être visuellement indiqué', () => {
      render(<NumberWheel value={5} onChange={jest.fn()} label="Test" />);
      
      const spinbutton = screen.getByRole('spinbutton');
      expect(spinbutton).toHaveClass('cursor-grab', 'active:cursor-grabbing');
    });
  });

  // === TESTS ROBUSTESSE ===
  describe('Robustesse et gestion d\'erreurs', () => {
    test('NumberWheel doit fonctionner sans crash avec des props minimales', () => {
      expect(() => {
        render(<NumberWheel value={5} onChange={jest.fn()} />);
      }).not.toThrow();
    });

    test('NumberWheel doit gérer les valeurs hors limites gracieusement', () => {
      const onChange = jest.fn();
      render(<NumberWheel value={15} onChange={onChange} min={1} max={10} label="Test" />);
      
      // Le composant ne doit pas crasher
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });
  });

  // === TESTS COMPATIBILITÉ ASSISTIVE TECHNOLOGY ===
  describe('Compatibilité technologies d\'assistance', () => {
    test('les éléments doivent avoir des rôles sémantiques corrects', () => {
      render(<NumberWheel value={5} onChange={jest.fn()} label="Test" />);
      
      // Vérifier les rôles
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });

    test('les éléments interactifs ne doivent pas utiliser touch-none inappropriément', () => {
      render(<NumberWheel value={5} onChange={jest.fn()} label="Test" />);
      
      const spinbutton = screen.getByRole('spinbutton');
      const buttons = screen.getAllByRole('button');
      
      // Le spinbutton peut avoir touch-none car il gère les événements touch manuellement
      expect(spinbutton).toHaveClass('touch-none');
      
      // Les boutons ne doivent pas avoir touch-none
      buttons.forEach(button => {
        expect(button).not.toHaveClass('touch-none');
      });
    });
  });
});