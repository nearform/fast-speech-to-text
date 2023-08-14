import { ChangeEvent, FC } from 'react';

import './styles.css';

type ChunkSizeProps = {
	chunkSize: number;
	max?: number;
	min?: number;
	onChange: (newSize: number) => void;
	step?: number;
};

export const ChunkSize: FC<ChunkSizeProps> = ({
	chunkSize,
	max = 6000,
	min = 100,
	onChange,
	step = 100
}) => {
	const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
		onChange(Number(event.target.value));

	return (
		<>
			<p>Use the range slider below to play around with the chunk length</p>

			<label className="chunk-slider">
				Chunk Duration (ms)
				<input type="range" min={min} max={max} step={step} onChange={handleChange} />
				{chunkSize} ms
			</label>
		</>
	);
};

ChunkSize.displayName = 'ChunkSize';
