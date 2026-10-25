from django.core.management.base import BaseCommand

from modelmate.models import ModelCategory, Task, TaskPrompt

# (slug, name, language, category name, description, test prompts)
TASKS = [
    (
        'summarize-long-documents', 'Summarize long documents', 'en', 'Natural Language Processing',
        'Turn reports, articles and PDFs into short, accurate summaries.',
        [
            'Summarize the key decisions and open questions from these meeting notes in 5 bullet points:\n'
            '- Budget for Q3 approved at 1.2M, marketing gets 30%.\n- Hiring freeze lifted for engineering only.\n'
            '- Launch date moved from Aug 1 to Aug 20 because of vendor delays.\n- No decision yet on the new office lease.\n'
            '- Sarah to propose a pricing change next week.',
        ],
    ),
    (
        'write-professional-email', 'Write a professional email', 'en', 'Natural Language Processing',
        'Clear, polite emails for work: requests, follow-ups, apologies.',
        [
            'Write a short, polite email to a client explaining that their order will be delayed by one week '
            'because of a supplier problem, and offer a 10% discount.',
            'Write a follow-up email to a recruiter I interviewed with 10 days ago and have not heard back from.',
        ],
    ),
    (
        'debug-python-code', 'Debug Python code', 'en', 'Generative AI',
        'Find and fix bugs, and explain what went wrong.',
        [
            'Why does this print [1, 2, 1, 2] on the second call, and how do I fix it?\n\n'
            'def add(item, items=[]):\n    items.append(item)\n    return items\n\n'
            'add(1); print(add(2))\nadd(1); print(add(2))',
        ],
    ),
    (
        'explain-concept-simply', 'Explain a concept simply', 'en', 'Natural Language Processing',
        'Explanations a student or non-expert can actually follow.',
        [
            'Explain how compound interest works to a 14-year-old, with one worked example.',
            'What is an API? Explain it to a small-business owner with no technical background.',
        ],
    ),
    (
        'translate-english-to-bangla', 'Translate English to Bangla', 'bn', 'Natural Language Processing',
        'Natural, fluent Bangla translations rather than word-for-word output.',
        [
            "Translate into natural, fluent Bangla: 'Please submit your application before the deadline. "
            "Late submissions will not be accepted under any circumstances.'",
            "Translate into Bangla for a health leaflet: 'Wash your hands with soap for at least 20 seconds "
            "before eating and after using the toilet.'",
        ],
    ),
    (
        'write-formal-bangla-letter', 'Write a formal letter in Bangla', 'bn', 'Natural Language Processing',
        'Applications and formal letters (abedon potro) in correct Bangla format.',
        [
            'প্রধান শিক্ষকের কাছে অসুস্থতার কারণে দুই দিনের ছুটি চেয়ে একটি আবেদনপত্র লেখো।',
            'এলাকায় ঘন ঘন বিদ্যুৎ বিভ্রাট নিয়ে স্থানীয় বিদ্যুৎ অফিসে একটি অভিযোগপত্র লেখো।',
        ],
    ),
    (
        'answer-questions-in-bangla', 'Answer questions in Bangla', 'bn', 'Natural Language Processing',
        'Accurate, easy-to-read answers written in Bangla.',
        [
            'সালোকসংশ্লেষণ কী? ষষ্ঠ শ্রেণির একজন ছাত্রকে সহজ ভাষায় বুঝিয়ে বলো।',
            'ডেঙ্গু জ্বরের লক্ষণগুলো কী কী এবং কখন ডাক্তারের কাছে যাওয়া উচিত?',
        ],
    ),
    (
        'summarize-bangla-text', 'Summarize Bangla text', 'bn', 'Natural Language Processing',
        'Short, faithful summaries of Bangla articles and passages.',
        [
            'নিচের অনুচ্ছেদটি তিন বাক্যে সারাংশ করো:\n'
            'বাংলাদেশ একটি নদীমাতৃক দেশ। এ দেশে ছোট-বড় প্রায় সাতশো নদী রয়েছে। নদীগুলো কৃষি, যোগাযোগ '
            'ও মাছ ধরার জন্য অত্যন্ত গুরুত্বপূর্ণ। তবে দূষণ ও দখলের কারণে অনেক নদী আজ হুমকির মুখে। '
            'নদী রক্ষায় সরকার ও জনগণের সম্মিলিত উদ্যোগ প্রয়োজন।',
        ],
    ),
]


class Command(BaseCommand):
    help = 'Create the starter set of buyer-guide tasks and their test prompts (safe to re-run).'

    def handle(self, *args, **options):
        created = 0
        for slug, name, language, category_name, description, prompts in TASKS:
            task, is_new = Task.objects.get_or_create(slug=slug, defaults={
                'name': name,
                'language': language,
                'description': description,
                'category': ModelCategory.objects.filter(name=category_name).first(),
                'is_featured': True,
            })
            created += is_new
            for prompt in prompts:
                TaskPrompt.objects.get_or_create(task=task, prompt=prompt)
        self.stdout.write(self.style.SUCCESS(f'{created} new task(s); {len(TASKS)} total in starter set.'))
