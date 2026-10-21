import { useLocale } from '../locale';
import { PanCoreArtwork } from './PanCoreArtwork';

export function SculptureStage() {
  const { t } = useLocale();
  return (
    <div className="sculpture-stage sculpture-stage-native">
      <PanCoreArtwork
        label={t(
          'PAN core: four partner nodes connected to a crowned obsidian hub by flowing pink channels',
          'Ядро PAN: четыре партнёрских узла и обсидиановый центр с короной, соединённые розовыми потоками',
        )}
      />
    </div>
  );
}
