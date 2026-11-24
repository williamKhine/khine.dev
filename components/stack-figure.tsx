import { CodeXml } from 'lucide-react';

export function StackFigure() {
  return <div className="stack-figure" aria-hidden="true">
    <div className="stack-model">
      <div className="plate plate-base" /><div className="plate plate-middle" />
      <div className="plate plate-top"><CodeXml size={58} strokeWidth={1.25} /></div>
    </div>
    <span className="figure-key">FIG. 01 <b>/</b> SYSTEM STACK</span>
  </div>;
}
