import React, { FC } from 'react';
import style from './index.module.scss';

type Props = {
    isTurnedOn: boolean,
    onSwitch: (isTurnedOn: boolean) => void,
}
const ToggleSwitch: FC<Props> = ({ isTurnedOn, onSwitch }) => {
    return (
        <label
            className={style.label}
        >
            <input
                type='checkbox'
                checked={isTurnedOn}

                onChange={(event) => onSwitch(event.target.checked)}
            />
            <span
                className={style.slider}
            />
        </label>
    );
}
export default ToggleSwitch;
