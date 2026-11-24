import { AudioLines, Layers, Inbox } from 'lucide-react';

export function ProjectPreview({ chart }: { chart: boolean }) {
  return <div className={`project-preview ${chart ? 'ledger' : 'relay'}`} aria-hidden="true">
    <div className="product-brand">{chart ? <Layers /> : <AudioLines />}{chart ? 'Ledger' : 'Relay'}</div>
    <div className="demo-pane"><div className="demo-bar"><i/><i/><i/><span>{chart ? 'ledger / overview' : 'relay / workspace'}</span></div>
      {chart ? <div className="demo-content"><small>MONTHLY EXPENSES</small><strong>$24,680<span>.00</span></strong><div className="demo-chart">{[36,55,44,67,51,72,63,83,75,91,78,99].map((n,i)=><i key={i} style={{height:`${n}%`}} />)}</div></div>
      : <div className="demo-content"><strong><Inbox size={13}/> Team inbox</strong>{['API integration request','Review pending handoff','Update workspace access'].map((text,i)=><div className="demo-row" key={text}><i/>{text}<span>0{i+1}</span></div>)}</div>}
    </div>
  </div>;
}
