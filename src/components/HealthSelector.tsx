import React from 'react';
import Select from '@material-ui/core/Select';

const PERCENT_GAPS = 5;
const healthScores = [...Array.from(new Array(100 / PERCENT_GAPS + 1), (_, index) => index * PERCENT_GAPS)]

type HealthSelectorProps = {
    nodeId: number,
    nodeHealthPercent: number,
    updateNodeHealthPercent: (nodeId: number, healthPercent: number) => void
};

// TODO: remove this now that we moved away from react-select
export type NodeDependencyListItem = {
    value: number,
    label: string,
    id: number /* needed for removal */
}

const HealthSelector = ({ nodeId, nodeHealthPercent, updateNodeHealthPercent }: HealthSelectorProps) => {
    const handleChange = (event: any /* TODO: find ValueType<T> declaration */) => {
        const percentHealth = event.target.value;
        updateNodeHealthPercent(nodeId, Number(percentHealth));
    }

    return (
        <Select
            native
            defaultValue={nodeHealthPercent ?? 100}
            onChange={handleChange}
            inputProps={{
                name: 'health',
                id: 'health-percent',
            }}
        >
            {
                healthScores.map((d: number) => <option key={`score-${d}`} value={d}>{d}</option>)
            }
        </Select>
    )
}

export default HealthSelector