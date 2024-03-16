import styles from "./switcher.module.css";
import { Atom, F, classes } from "@grammarly/focal";

type Size = "small" | "medium" | "large" | "xlarge";

interface SwitcherProps {
  state: Atom<boolean>;
  onStateChange?(state: boolean): void;
  size?: Size;
  disabled?: boolean;
  className?: string;
}

export const Switcher: React.FC<SwitcherProps> = ({ state, onStateChange, disabled, className, size = "medium" }) => {
  const handleClick = () => {
    if (disabled) return;
    state.modify(x => {
      return !x;
    });

    onStateChange?.(state.get());
  };

  return (
    <F.span
      onClick={handleClick}
      {...classes(
        styles.switcher,
        disabled ? styles.disabled : null,
        state.view(x => (!!x ? styles.active : null)),
        className,
        styles[size],
      )}
    >
      <span className={styles.thumbler}></span>
    </F.span>
  );
};
