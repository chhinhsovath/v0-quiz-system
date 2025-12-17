"use client"

import { useState } from "react"
import type { Question, QuestionType } from "@/lib/quiz-types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, MoveVertical } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"

interface QuestionEditorProps {
  question: Question
  onUpdate: (updates: Partial<Question>) => void
  language?: string
}

export function QuestionEditor({ question, onUpdate, language = "en" }: QuestionEditorProps) {
  const t = {
    question: language === "km" ? "សំណួរ" : "Question",
    questionText: language === "km" ? "អត្ថបទសំណួរ" : "Question Text",
    questionTextKm: language === "km" ? "អត្ថបទសំណួរ (ខ្មែរ)" : "Question Text (Khmer)",
    points: language === "km" ? "ពិន្ទុ" : "Points",
    questionType: language === "km" ? "ប្រភេទសំណួរ" : "Question Type",
    multipleChoice: language === "km" ? "ពហុជ្រើសរើស" : "Multiple Choice",
    multipleSelect: language === "km" ? "ជ្រើសរើសច្រើន" : "Multiple Select",
    trueFalse: language === "km" ? "ពិត/មិនពិត" : "True/False",
    shortAnswer: language === "km" ? "ចម្លើយខ្លី" : "Short Answer",
    fillBlanks: language === "km" ? "បំពេញចន្លោះ" : "Fill in Blanks",
    dragDrop: language === "km" ? "អូស និងទម្លាក់" : "Drag & Drop",
    matching: language === "km" ? "ផ្គូផ្គង" : "Matching",
    ordering: language === "km" ? "តម្រៀប" : "Ordering",
    essay: language === "km" ? "និពន្ធ" : "Essay",
    imageChoice: language === "km" ? "ជ្រើសរើសរូបភាព" : "Image Choice",
    hotspot: language === "km" ? "ចំណុចក្តៅ" : "Hotspot",
    answerOptions: language === "km" ? "ជម្រើសចម្លើយ" : "Answer Options",
    selectCorrectAnswer: language === "km" ? "ជ្រើសរើសចម្លើយត្រឹមត្រូវ" : "Select correct answer",
    selectAllCorrectAnswers: language === "km" ? "ជ្រើសរើសចម្លើយត្រឹមត្រូវទាំងអស់" : "Select all correct answers",
    correctAnswer: language === "km" ? "ចម្លើយត្រឹមត្រូវ" : "Correct Answer",
    addOption: language === "km" ? "បន្ថែមជម្រើស" : "Add Option",
    templateUseBlanks: language === "km" ? "ទំព័រគំរូ (ប្រើ ___)" : "Template (use ___)",
    blanksDetected: language === "km" ? "ចន្លោះរកឃើញ" : "blanks detected",
    correctAnswersInOrder: language === "km" ? "ចម្លើយត្រឹមត្រូវតាមលំដាប់" : "Correct Answers (in order)",
    itemsWillBeShuffled: language === "km" ? "ធាតុនឹងត្រូវបានច្របល់" : "Items (will be shuffled for students)",
    matchingPairs: language === "km" ? "គូផ្គូផ្គង" : "Matching Pairs",
    itemsInCorrectOrder: language === "km" ? "ធាតុតាមលំដាប់ត្រឹមត្រូវ" : "Items in Correct Order",
    enterItemsInSequence: language === "km" ? "បញ្ចូលធាតុតាមលំដាប់" : "Enter items in correct sequence",
    essayManualGrading: language === "km" ? "និពន្ធនឹងត្រូវដាក់ពិន្ទុដោយដៃ" : "Essay questions require manual grading",
    sampleAnswerRubric: language === "km" ? "ចម្លើយគំរូ/លក្ខណៈវិនិច្ឆ័យ" : "Sample Answer / Rubric",
    sampleAnswerForInstructors: language === "km" ? "នេះសម្រាប់សង្កេតគ្រូតែប៉ុណ្ណោះ" : "This is for instructor reference only",
    rightSideShuffled: language === "km" ? "ផ្នែកខាងស្តាំនឹងត្រូវបានច្របល់" : "Right side will be shuffled",
    imageUrl: language === "km" ? "URL រូបភាព" : "Image URL",
    correctOrderDesc: language === "km" ? "ធាតុនឹងត្រូវបានច្របល់សម្រាប់សិស្ស" : "Items will be shuffled for students to reorder",
    answerMatchingCaseInsensitive: language === "km" ? "ការផ្គូផ្គងមិនអាស្រ័យលើតួអក្សរធំតូច" : "Answer matching is case-insensitive",
    enterCorrectAnswer: language === "km" ? "បញ្ចូលចម្លើយត្រឹមត្រូវ" : "Enter correct answer",
    imageHotspotDesc: language === "km" ? "សិស្សនឹងចុចលើចំណុចនៅលើរូបភាព" : "Students will click on specific areas of the image",
    difficulty: language === "km" ? "កម្រិតពិបាក" : "Difficulty",
    easy: language === "km" ? "ងាយ" : "Easy",
    medium: language === "km" ? "មធ្យម" : "Medium",
    hard: language === "km" ? "ពិបាក" : "Hard",
    explanation: language === "km" ? "ការពន្យល់" : "Explanation",
    explanationOptional: language === "km" ? "ការពន្យល់ (ស្រេចចិត្ត)" : "Explanation (Optional)",
    explanationKm: language === "km" ? "ការពន្យល់ (ខ្មែរ)" : "Explanation (Khmer)",
  }

  const handleTypeChange = (type: QuestionType) => {
    let options: string[] | undefined
    let correctAnswer: string | string[] | Record<string, string> = ""
    let blanksTemplate: string | undefined
    let blanksCount: number | undefined
    let pairs: Array<{ left: string; right: string }> | undefined
    let imageUrl: string | undefined
    let hotspots: Array<{ x: number; y: number; label: string }> | undefined

    if (type === "multiple-choice" || type === "multiple-select") {
      options = ["", "", "", ""]
      correctAnswer = type === "multiple-select" ? [] : ""
    } else if (type === "true-false") {
      options = ["True", "False"]
      correctAnswer = ""
    } else if (type === "drag-drop") {
      options = ["", "", "", ""]
      correctAnswer = []
    } else if (type === "fill-blanks") {
      blanksTemplate = "The ___ is ___."
      blanksCount = 2
      correctAnswer = ["", ""]
    } else if (type === "matching") {
      pairs = [
        { left: "", right: "" },
        { left: "", right: "" },
      ]
      correctAnswer = {}
    } else if (type === "ordering") {
      options = ["", "", ""]
      correctAnswer = []
    } else if (type === "image-choice") {
      options = ["", "", "", ""]
      correctAnswer = ""
      imageUrl = ""
    } else if (type === "hotspot") {
      imageUrl = ""
      hotspots = []
      correctAnswer = []
    } else if (type === "essay") {
      correctAnswer = ""
    } else {
      options = undefined
      correctAnswer = ""
    }

    onUpdate({
      type,
      options,
      correctAnswer,
      blanksTemplate,
      blanksCount,
      pairs,
      imageUrl,
      hotspots,
    })
  }

  const updateOption = (optionIndex: number, value: string) => {
    if (!question.options) return
    const newOptions = [...question.options]
    newOptions[optionIndex] = value
    onUpdate({ options: newOptions })
  }

  const addOption = () => {
    if (!question.options) return
    onUpdate({ options: [...question.options, ""] })
  }

  const removeOption = (optionIndex: number) => {
    if (!question.options || question.options.length <= 2) return
    const newOptions = question.options.filter((_, i) => i !== optionIndex)
    onUpdate({ options: newOptions })
  }

  return (
    <div className="space-y-4">
      {/* Question Type */}
      <div className="space-y-2">
        <Label>{t.questionType}</Label>
        <Select value={question.type} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multiple-choice">{t.multipleChoice}</SelectItem>
            <SelectItem value="multiple-select">{t.multipleSelect}</SelectItem>
            <SelectItem value="true-false">{t.trueFalse}</SelectItem>
            <SelectItem value="short-answer">{t.shortAnswer}</SelectItem>
            <SelectItem value="fill-blanks">{t.fillBlanks}</SelectItem>
            <SelectItem value="drag-drop">{t.dragDrop}</SelectItem>
            <SelectItem value="matching">{t.matching}</SelectItem>
            <SelectItem value="ordering">{t.ordering}</SelectItem>
            <SelectItem value="essay">{t.essay}</SelectItem>
            <SelectItem value="image-choice">{t.imageChoice}</SelectItem>
            <SelectItem value="hotspot">{t.hotspot}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Question Text - English */}
      <div className="space-y-2">
        <Label>{t.questionText}</Label>
        <Textarea
          placeholder="Enter your question here"
          value={question.question}
          onChange={(e) => onUpdate({ question: e.target.value })}
          rows={2}
        />
      </div>

      {/* Question Text - Khmer */}
      <div className="space-y-2">
        <Label>{t.questionTextKm}</Label>
        <Textarea
          placeholder="បញ្ចូលសំណួររបស់អ្នកនៅទីនេះ"
          value={question.questionKm || ""}
          onChange={(e) => onUpdate({ questionKm: e.target.value })}
          rows={2}
          className="font-khmer"
        />
      </div>

      {/* Points and Difficulty */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t.points}</Label>
          <Input
            type="number"
            min="1"
            value={question.points}
            onChange={(e) => onUpdate({ points: Number.parseInt(e.target.value) || 1 })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t.difficulty}</Label>
          <Select
            value={question.difficulty || "medium"}
            onValueChange={(value: "easy" | "medium" | "hard") => onUpdate({ difficulty: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">{t.easy}</SelectItem>
              <SelectItem value="medium">{t.medium}</SelectItem>
              <SelectItem value="hard">{t.hard}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Multiple Choice */}
      {question.type === "multiple-choice" && question.options && (
        <div className="space-y-3">
          <Label>{t.answerOptions} ({t.selectCorrectAnswer})</Label>
          <RadioGroup
            value={question.correctAnswer as string}
            onValueChange={(value) => onUpdate({ correctAnswer: value })}
          >
            {question.options.map((option, optIndex) => (
              <div key={optIndex} className="flex items-center gap-2">
                <RadioGroupItem value={option} id={`option-${optIndex}`} />
                <Input
                  placeholder={`Option ${optIndex + 1}`}
                  value={option}
                  onChange={(e) => updateOption(optIndex, e.target.value)}
                  className="flex-1"
                />
                {question.options && question.options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(optIndex)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </RadioGroup>
          <Button variant="outline" size="sm" onClick={addOption}>
            <Plus className="h-4 w-4 mr-2" />
            {t.addOption}
          </Button>
        </div>
      )}

      {/* Multiple Select */}
      {question.type === "multiple-select" && question.options && (
        <div className="space-y-3">
          <Label>{t.answerOptions} ({t.selectAllCorrectAnswers})</Label>
          <div className="space-y-2">
            {question.options.map((option, optIndex) => (
              <div key={optIndex} className="flex items-center gap-2">
                <Checkbox
                  id={`option-${optIndex}`}
                  checked={Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option)}
                  onCheckedChange={(checked) => {
                    const currentAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : []
                    const newAnswers = checked
                      ? [...currentAnswers, option]
                      : currentAnswers.filter((a) => a !== option)
                    onUpdate({ correctAnswer: newAnswers })
                  }}
                />
                <Input
                  placeholder={`Option ${optIndex + 1}`}
                  value={option}
                  onChange={(e) => updateOption(optIndex, e.target.value)}
                  className="flex-1"
                />
                {question.options && question.options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(optIndex)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addOption}>
            <Plus className="h-4 w-4 mr-2" />
            {t.addOption}
          </Button>
        </div>
      )}

      {/* True/False */}
      {question.type === "true-false" && (
        <div className="space-y-2">
          <Label>{t.correctAnswer}</Label>
          <RadioGroup
            value={question.correctAnswer as string}
            onValueChange={(value) => onUpdate({ correctAnswer: value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="True" id="true" />
              <Label htmlFor="true">True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="False" id="false" />
              <Label htmlFor="false">False</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Short Answer */}
      {question.type === "short-answer" && (
        <div className="space-y-2">
          <Label>{t.correctAnswer}</Label>
          <Input
            placeholder={t.enterCorrectAnswer}
            value={question.correctAnswer as string}
            onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">{t.answerMatchingCaseInsensitive}</p>
        </div>
      )}

      {/* Fill in Blanks */}
      {question.type === "fill-blanks" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>{t.templateUseBlanks}</Label>
            <Textarea
              placeholder="The capital of France is ___. It has a population of over ___ million."
              value={question.blanksTemplate || ""}
              onChange={(e) => {
                const template = e.target.value
                const count = (template.match(/___/g) || []).length
                const answers = Array.isArray(question.correctAnswer) ? question.correctAnswer : []
                const newAnswers = Array(count)
                  .fill("")
                  .map((_, i) => answers[i] || "")
                onUpdate({
                  blanksTemplate: template,
                  blanksCount: count,
                  correctAnswer: newAnswers,
                })
              }}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{question.blanksCount || 0} {t.blanksDetected}</p>
          </div>
          {question.blanksCount && question.blanksCount > 0 && (
            <div className="space-y-2">
              <Label>{t.correctAnswersInOrder}</Label>
              {Array.from({ length: question.blanksCount }).map((_, index) => (
                <Input
                  key={index}
                  placeholder={`Answer for blank ${index + 1}`}
                  value={Array.isArray(question.correctAnswer) ? (question.correctAnswer[index] as string) || "" : ""}
                  onChange={(e) => {
                    const answers = Array.isArray(question.correctAnswer) ? [...question.correctAnswer] : []
                    answers[index] = e.target.value
                    onUpdate({ correctAnswer: answers })
                  }}
                />
              ))}
              <p className="text-xs text-muted-foreground">{t.answerMatchingCaseInsensitive}</p>
            </div>
          )}
        </div>
      )}

      {/* Drag & Drop */}
      {question.type === "drag-drop" && question.options && (
        <div className="space-y-3">
          <Label>{t.itemsWillBeShuffled}</Label>
          <div className="space-y-2">
            {question.options.map((option, optIndex) => (
              <div key={optIndex} className="flex items-center gap-2">
                <MoveVertical className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Item ${optIndex + 1}`}
                  value={option}
                  onChange={(e) => updateOption(optIndex, e.target.value)}
                  className="flex-1"
                />
                {question.options && question.options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(optIndex)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addOption}>
            <Plus className="h-4 w-4 mr-2" />
            {t.addOption}
          </Button>
          <p className="text-xs text-muted-foreground">{t.correctOrderDesc}</p>
        </div>
      )}

      {/* Matching */}
      {question.type === "matching" && question.pairs && (
        <div className="space-y-3">
          <Label>{t.matchingPairs}</Label>
          {question.pairs.map((pair, pairIndex) => (
            <div key={pairIndex} className="flex items-center gap-2">
              <Input
                placeholder="Left side"
                value={pair.left}
                onChange={(e) => {
                  const newPairs = [...question.pairs!]
                  newPairs[pairIndex] = { ...newPairs[pairIndex], left: e.target.value }
                  onUpdate({ pairs: newPairs })
                }}
                className="flex-1"
              />
              <span className="text-muted-foreground">↔</span>
              <Input
                placeholder="Right side"
                value={pair.right}
                onChange={(e) => {
                  const newPairs = [...question.pairs!]
                  newPairs[pairIndex] = { ...newPairs[pairIndex], right: e.target.value }
                  onUpdate({ pairs: newPairs })
                }}
                className="flex-1"
              />
              {question.pairs && question.pairs.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newPairs = question.pairs!.filter((_, i) => i !== pairIndex)
                    onUpdate({ pairs: newPairs })
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newPairs = [...(question.pairs || []), { left: "", right: "" }]
              onUpdate({ pairs: newPairs })
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t.addOption}
          </Button>
          <p className="text-xs text-muted-foreground">{t.rightSideShuffled}</p>
        </div>
      )}

      {/* Ordering */}
      {question.type === "ordering" && question.options && (
        <div className="space-y-3">
          <Label>{t.itemsInCorrectOrder}</Label>
          <p className="text-xs text-muted-foreground">{t.enterItemsInSequence}</p>
          <div className="space-y-2">
            {question.options.map((option, optIndex) => (
              <div key={optIndex} className="flex items-center gap-2">
                <span className="text-sm font-medium w-6">{optIndex + 1}.</span>
                <Input
                  placeholder={`Step ${optIndex + 1}`}
                  value={option}
                  onChange={(e) => updateOption(optIndex, e.target.value)}
                  className="flex-1"
                />
                {question.options && question.options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(optIndex)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addOption}>
            <Plus className="h-4 w-4 mr-2" />
            {t.addOption}
          </Button>
        </div>
      )}

      {/* Essay */}
      {question.type === "essay" && (
        <div className="space-y-3">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              {t.essayManualGrading}
            </p>
          </div>
          <div className="space-y-2">
            <Label>{t.sampleAnswerRubric}</Label>
            <Textarea
              placeholder="Enter a sample answer or grading criteria for reference"
              value={question.correctAnswer as string}
              onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">{t.sampleAnswerForInstructors}</p>
          </div>
        </div>
      )}

      {/* Image Choice */}
      {question.type === "image-choice" && question.options && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>{t.imageUrl}</Label>
            <ImageUpload
              value={question.imageUrl || ""}
              onChange={(imageUrl) => onUpdate({ imageUrl })}
              maxSizeMB={5}
            />
          </div>
          <Label>{t.answerOptions} ({t.selectCorrectAnswer})</Label>
          <RadioGroup
            value={question.correctAnswer as string}
            onValueChange={(value) => onUpdate({ correctAnswer: value })}
          >
            {question.options.map((option, optIndex) => (
              <div key={optIndex} className="flex items-center gap-2">
                <RadioGroupItem value={option} id={`option-${optIndex}`} />
                <Input
                  placeholder={`Option ${optIndex + 1}`}
                  value={option}
                  onChange={(e) => updateOption(optIndex, e.target.value)}
                  className="flex-1"
                />
                {question.options && question.options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(optIndex)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </RadioGroup>
          <Button variant="outline" size="sm" onClick={addOption}>
            <Plus className="h-4 w-4 mr-2" />
            {t.addOption}
          </Button>
        </div>
      )}

      {/* Hotspot */}
      {question.type === "hotspot" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>{t.imageUrl}</Label>
            <ImageUpload
              value={question.imageUrl || ""}
              onChange={(imageUrl) => onUpdate({ imageUrl })}
              maxSizeMB={5}
            />
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              {t.imageHotspotDesc}
            </p>
          </div>
        </div>
      )}

      {/* Explanation (for all types) */}
      <div className="space-y-2">
        <Label>{t.explanationOptional}</Label>
        <Textarea
          placeholder="Provide an explanation for the answer"
          value={question.explanation || ""}
          onChange={(e) => onUpdate({ explanation: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>{t.explanationKm}</Label>
        <Textarea
          placeholder="ផ្តល់ការពន្យល់សម្រាប់ចម្លើយ"
          value={question.explanationKm || ""}
          onChange={(e) => onUpdate({ explanationKm: e.target.value })}
          rows={2}
          className="font-khmer"
        />
      </div>
    </div>
  )
}
