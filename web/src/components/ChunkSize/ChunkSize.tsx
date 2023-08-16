import { FC } from 'react';
import Slider from 'rc-slider';

import 'rc-slider/assets/index.css';
import './styles.css';

type ChunkSizeProps = {
	chunkSize: number;
	max?: number;
	min?: number;
	// it'll never be an array, but has to accept them to satisfy the prop type on Slider component
	onChange: (newSize: number | number[]) => void;
	step?: number;
};

export const ChunkSize: FC<ChunkSizeProps> = ({
	chunkSize,
	max = 6000,
	min = 100,
	onChange,
	step = 100
}) => {
	return (
		<>
			<div className="chunk-size">
				<div className="label">
					<span>Chunk Duration (ms)</span> <span>{chunkSize} ms</span>
				</div>
				<Slider
					className="chunk-slider"
					defaultValue={chunkSize}
					handleStyle={{
						backgroundColor: 'white',
						border: 'none',
						borderRadius: '50%',
						height: '30px',
						marginTop: '-10px',
						width: '30px'
					}}
					max={max}
					min={min}
					onChange={onChange}
					railStyle={{
						backgroundColor: '#2d486b',
						borderRadius: '5px',
						height: '10px'
					}}
					step={step}
					trackStyle={{
						backgroundColor: '#2936af',
						borderRadius: '5px',
						height: '10px'
					}}
				/>
			</div>
		</>
	);
};

ChunkSize.displayName = 'ChunkSize';
