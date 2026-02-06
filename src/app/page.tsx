import { MemoriesExperience } from "@/components/MemoriesExperience";
import { ValentinePrompt } from "@/components/ValentinePrompt";
import {
  coupleProfile,
  heroLines,
  reasonsILoveYou,
} from "@/data/story";
import { generatedMemories } from "@/data/generatedMemories";

export default function Home() {
  return (
    <main>
      <section className="hero section-shell">
        <p className="eyebrow">A love story, coded with heart</p>
        <h1>
          {coupleProfile.partnerName},
          <br />
          will you be my Valentine?
        </h1>
        <p className="lead">
          From {coupleProfile.relationshipStart} to {coupleProfile.proposalDate},
          every chapter with you has been my favorite one.
        </p>

        <div className="hero-notes">
          {heroLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </section>

      <MemoriesExperience folders={generatedMemories} />

      <section className="reasons section-shell" id="reasons">
        <div className="section-title-wrap">
          <p className="eyebrow">A short list (that keeps growing)</p>
          <h2>Why I love you</h2>
        </div>

        <div className="reasons-grid">
          {reasonsILoveYou.map((reason) => (
            <article key={reason} className="reason-card reveal">
              <span>♥</span>
              <p>{reason}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="proposal section-shell" id="proposal">
        <div className="section-title-wrap">
          <p className="eyebrow">The big question</p>
          <h2>This part matters most</h2>
        </div>
        <ValentinePrompt partnerName={coupleProfile.partnerName} />
      </section>

      <footer className="footer section-shell">
        <p>Made by {coupleProfile.yourName}, with way too much love.</p>
      </footer>
    </main>
  );
}
