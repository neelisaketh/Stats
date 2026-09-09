import { PracticeCenter } from "@/components/practice-center";
import { VocabMatch } from "@/components/vocab-match";
export default function GamesPage(){return <main className="page-shell activity-page"><div className="activity-heading"><span className="kicker">Statlab / Games</span><h1>Turn vocabulary into points.</h1><p>Untimed rounds. Fresh choices. Learn from every answer.</p></div><PracticeCenter mode="vocab"/><VocabMatch/></main>}
