import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, ArrowLeft, Upload, X, User, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/stories/new")({
  component: NewStory,
});

type Character = {
  name: string; gender: string; age: string; height: string; body_type: string;
  skin_tone: string; hair_style: string; hair_color: string; eye_color: string;
  outfit_style: string; personality: string; manga_style: string;
  ref_file?: File | null; ref_preview?: string;
};

const newChar = (): Character => ({
  name: "", gender: "", age: "", height: "", body_type: "",
  skin_tone: "", hair_style: "", hair_color: "", eye_color: "",
  outfit_style: "", personality: "", manga_style: "shounen",
  ref_file: null, ref_preview: undefined,
});

const STEPS = ["Story", "Characters", "Scenes"];

function NewStory() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [storyText, setStoryText] = useState("");
  const [tags, setTags] = useState("");

  // Step 2
  const [chars, setChars] = useState<Character[]>([newChar()]);

  // Step 3
  const [panels, setPanels] = useState(12);
  const [artStyle, setArtStyle] = useState("habesha-fusion");
  const [mood, setMood] = useState("adventurous");
  const [camera, setCamera] = useState("cinematic");
  const [dialogue, setDialogue] = useState("balanced");
  const [intensity, setIntensity] = useState("vivid");
  const [pacing, setPacing] = useState("steady");

  const updateChar = (i: number, patch: Partial<Character>) => {
    setChars((arr) => arr.map((c, idx) => idx === i ? { ...c, ...patch } : c));
  };

  const handleFile = (i: number, file: File | null) => {
    if (!file) return updateChar(i, { ref_file: null, ref_preview: undefined });
    const url = URL.createObjectURL(file);
    updateChar(i, { ref_file: file, ref_preview: url });
  };

  const canNext = () => {
    if (step === 0) return title.trim() && storyText.trim();
    if (step === 1) return chars.every((c) => c.name.trim());
    return true;
  };

  const submit = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const tagsArr = tags.split(",").map(t => t.trim()).filter(Boolean);
      const { data: story, error: e1 } = await supabase.from("stories").insert({
        user_id: user.id, title, genre, description, story_text: storyText, tags: tagsArr, status: "draft",
      }).select().single();
      if (e1) throw e1;

      // Upload character refs + insert
      for (const c of chars) {
        let refUrl: string | null = null;
        if (c.ref_file) {
          const path = `${user.id}/${story.id}/${crypto.randomUUID()}-${c.ref_file.name}`;
          const { error: upErr } = await supabase.storage.from("character-references").upload(path, c.ref_file);
          if (!upErr) {
            const { data } = supabase.storage.from("character-references").getPublicUrl(path);
            refUrl = data.publicUrl;
          }
        }
        await supabase.from("characters").insert({
          story_id: story.id, user_id: user.id, name: c.name,
          gender: c.gender || null, age: c.age ? parseInt(c.age) : null,
          height: c.height || null, body_type: c.body_type || null,
          skin_tone: c.skin_tone || null, hair_style: c.hair_style || null,
          hair_color: c.hair_color || null, eye_color: c.eye_color || null,
          outfit_style: c.outfit_style || null, personality: c.personality || null,
          manga_style: c.manga_style, reference_image_url: refUrl,
        });
      }

      await supabase.from("manga_projects").insert({
        story_id: story.id, user_id: user.id,
        panel_count: panels, art_style: artStyle, mood, camera_style: camera,
        dialogue_density: dialogue, visual_intensity: intensity, story_pacing: pacing,
        status: "pending",
      });

      toast.success("Story saved! Generation queued.");
      nav({ to: "/dashboard/stories" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-4xl">
      <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">// New Story</div>
      <h1 className="font-display text-3xl font-bold mb-6">Create a new story</h1>

      {/* Stepper */}
      <div className="flex items-center gap-3 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-3 flex-1">
            <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold transition ${
              i < step ? "bg-primary text-primary-foreground" :
              i === step ? "bg-primary text-primary-foreground glow-emerald" :
              "bg-muted text-muted-foreground"
            }`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <div className={`text-sm ${i === step ? "font-medium text-foreground" : "text-muted-foreground"}`}>{label}</div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border" />}
          </div>
        ))}
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel rounded-2xl p-6 sm:p-8 shadow-soft">
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <Label>Story title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The Last Warrior of Lalibela" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Genre</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger><SelectValue placeholder="Select genre" /></SelectTrigger>
                  <SelectContent>
                    {["Action", "Romance", "Fantasy", "Sci-Fi", "Slice of Life", "Mystery", "Historical", "Cyberpunk"].map(g =>
                      <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="warrior, magic, friendship" />
              </div>
            </div>
            <div>
              <Label>Short description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A one-line hook for your story." />
            </div>
            <div>
              <Label>Story text</Label>
              <Textarea value={storyText} onChange={(e) => setStoryText(e.target.value)} rows={10}
                placeholder="Once upon a time, beneath the highlands of Lalibela…" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground glass-panel rounded-lg p-3">
              💡 Reference images help the AI maintain a more consistent appearance throughout the story.
            </div>

            {chars.map((c, i) => (
              <div key={i} className="rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-display font-semibold">Character {i + 1}</span>
                  </div>
                  {chars.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => setChars(arr => arr.filter((_, idx) => idx !== i))}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid sm:grid-cols-[140px_1fr] gap-5">
                  {/* Ref image */}
                  <div>
                    <label className="block">
                      <div className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition overflow-hidden relative ${
                        c.ref_preview ? "border-primary" : "border-border hover:border-primary/50 hover:bg-accent/40"
                      }`}>
                        {c.ref_preview ? (
                          <>
                            <img src={c.ref_preview} alt="ref" className="absolute inset-0 w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); handleFile(i, null); }}
                              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/90 flex items-center justify-center"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </>
                        ) : (
                          <>
                            <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                            <span className="text-xs text-muted-foreground">Reference</span>
                          </>
                        )}
                      </div>
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => handleFile(i, e.target.files?.[0] ?? null)} />
                    </label>
                  </div>

                  {/* Fields */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><Label>Name</Label><Input value={c.name} onChange={(e) => updateChar(i, { name: e.target.value })} /></div>
                    <div><Label>Gender</Label><Input value={c.gender} onChange={(e) => updateChar(i, { gender: e.target.value })} /></div>
                    <div><Label>Age</Label><Input type="number" value={c.age} onChange={(e) => updateChar(i, { age: e.target.value })} /></div>
                    <div><Label>Height</Label><Input value={c.height} onChange={(e) => updateChar(i, { height: e.target.value })} placeholder="e.g. 175cm" /></div>
                    <div><Label>Body type</Label><Input value={c.body_type} onChange={(e) => updateChar(i, { body_type: e.target.value })} /></div>
                    <div><Label>Skin tone</Label><Input value={c.skin_tone} onChange={(e) => updateChar(i, { skin_tone: e.target.value })} /></div>
                    <div><Label>Hair style</Label><Input value={c.hair_style} onChange={(e) => updateChar(i, { hair_style: e.target.value })} /></div>
                    <div><Label>Hair color</Label><Input value={c.hair_color} onChange={(e) => updateChar(i, { hair_color: e.target.value })} /></div>
                    <div><Label>Eye color</Label><Input value={c.eye_color} onChange={(e) => updateChar(i, { eye_color: e.target.value })} /></div>
                    <div><Label>Outfit style</Label><Input value={c.outfit_style} onChange={(e) => updateChar(i, { outfit_style: e.target.value })} /></div>
                    <div className="sm:col-span-2"><Label>Personality</Label><Input value={c.personality} onChange={(e) => updateChar(i, { personality: e.target.value })} placeholder="brave, sarcastic, loyal" /></div>
                    <div className="sm:col-span-2">
                      <Label>Manga style</Label>
                      <Select value={c.manga_style} onValueChange={(v) => updateChar(i, { manga_style: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["shounen", "shoujo", "seinen", "habesha-fusion", "chibi", "cyberpunk"].map(s =>
                            <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={() => setChars(arr => [...arr, newChar()])} className="w-full">
              + Add another character
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <Label>Number of manga panels: {panels}</Label>
              <Slider value={[panels]} min={4} max={60} step={2} onValueChange={(v) => setPanels(v[0])} className="mt-3" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {([
                ["Art style", artStyle, setArtStyle, ["shounen", "shoujo", "seinen", "habesha-fusion", "watercolor", "cyberpunk"]],
                ["Mood", mood, setMood, ["adventurous", "melancholic", "romantic", "intense", "playful", "mysterious"]],
                ["Camera style", camera, setCamera, ["cinematic", "wide", "close-up", "dynamic", "static"]],
                ["Dialogue density", dialogue, setDialogue, ["minimal", "balanced", "heavy"]],
                ["Visual intensity", intensity, setIntensity, ["soft", "vivid", "dramatic"]],
                ["Story pacing", pacing, setPacing, ["slow", "steady", "fast"]],
              ] as const).map(([label, val, setter, opts]) => (
                <div key={label}>
                  <Label>{label}</Label>
                  <Select value={val} onValueChange={setter as (v: string) => void}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {opts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-start gap-3">
              <Wand2 className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm">
                <div className="font-medium">Ready to generate</div>
                <div className="text-muted-foreground">Your story will be queued for AI panel generation once saved.</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground glow-emerald">
              {saving ? "Saving…" : "Save & queue generation"}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
