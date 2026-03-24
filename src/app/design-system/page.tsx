import { DesignSystemLayout } from "@/components/layout/DesignSystemLayout"
import { ComponentSection } from "@/components/layout/ComponentSection"
import { GlassmorphismCard } from "@/components/design-system/GlassmorphismCard"
import { DemoForms } from "@/components/design-system/DemoForms"
import {
  LogoDemo,
  TypographyDemo,
  ButtonsDemo,
  InputsDemo,
  InteractionsDemo,
  NavigationDemo,
  CalendarDemo
} from "@/components/design-system/DesignSystemSections"

export default function DesignSystemPage() {
  return (
    <DesignSystemLayout>
      <ComponentSection title="Identité Visuelle (Logos)">
        <LogoDemo />
      </ComponentSection>
      
      <ComponentSection title="Typographie">
        <TypographyDemo />
      </ComponentSection>

      <ComponentSection title="Boutons Interactifs">
        <ButtonsDemo />
      </ComponentSection>

      <ComponentSection title="Formulaires (Inputs)">
        <InputsDemo />
      </ComponentSection>

      <ComponentSection title="Vibrance & Glassmorphism">
        <GlassmorphismCard />
      </ComponentSection>

      <ComponentSection title="Composants Concrets (V5)">
        <DemoForms />
      </ComponentSection>

      <ComponentSection title="Interactions & Éléments Globaux">
        <InteractionsDemo />
      </ComponentSection>

      <ComponentSection title="Navigation & Fenêtres Modales">
        <NavigationDemo />
      </ComponentSection>

      <ComponentSection title="Le Calendrier IronTrack" description="Représentation visuelle du système de planification des séances.">
        <CalendarDemo />
      </ComponentSection>
    </DesignSystemLayout>
  )
}
